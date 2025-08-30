import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { DialogState, DialogContentFunction, PromiseDialogFunction, DialogCloseFunction, ToastState, ToastOptions, AddToastFunction, ToastContentFunction, ToastCloseFunction } from './types';
import { Box } from '../Box';
import { Button } from '../Button';
import { disableScroller, enableScroller } from '../../../utils/scrollUtils';
import { FaTimes, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

interface PromiseDialogContextType {
    openDialog: PromiseDialogFunction;
    addToast: AddToastFunction;
}

const PromiseDialogContext = createContext<PromiseDialogContextType | undefined>(undefined);

interface PromiseDialogProviderProps {
    children: ReactNode;
}

export const PromiseDialogProvider: React.FC<PromiseDialogProviderProps> = ({ children }) => {
    const [dialogStack, setDialogStack] = useState<DialogState[]>([]);
    const [toastStack, setToastStack] = useState<ToastState[]>([]);
    const dialogCounter = useRef(0);
    const toastCounter = useRef(0);
    const scrollPositionRef = useRef<number>(0);
    const toastCloseFunctions = useRef<Map<string, ToastCloseFunction>>(new Map());

    const openDialog: PromiseDialogFunction = <T = any>(content: DialogContentFunction<T>): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
            const dialogId = `dialog-${++dialogCounter.current}`;
            
            const closeFunction: DialogCloseFunction<T> = (result: T) => {
                // Remove this dialog from the stack
                setDialogStack(prev => prev.filter(dialog => dialog.id !== dialogId));
                resolve(result);
            };

            const dialogContent = content(closeFunction);
            
            const newDialog: DialogState<T> = {
                id: dialogId,
                content: dialogContent,
                resolve,
                reject
            };

            // Add to the stack
            setDialogStack(prev => [...prev, newDialog]);
        });
    };

    const addToast: AddToastFunction = (content: React.ReactNode | ToastContentFunction, options: ToastOptions = {}): string => {
        const toastId = `toast-${++toastCounter.current}`;
        
        const defaultOptions: ToastOptions = {
            autoHide: true,
            duration: 4000,
            type: 'info',
            showCloseButton: true,
            ...options
        };

        const closeFunction: ToastCloseFunction = () => {
            setToastStack(prev => prev.filter(toast => toast.id !== toastId));
            toastCloseFunctions.current.delete(toastId);
        };

        // Store close function for later use
        toastCloseFunctions.current.set(toastId, closeFunction);

        const toastContent = typeof content === 'function' 
            ? (content as ToastContentFunction)(closeFunction)
            : content;
        
        const newToast: ToastState = {
            id: toastId,
            content: toastContent,
            options: defaultOptions,
            timestamp: Date.now()
        };

        // Add to the toast stack
        setToastStack(prev => [...prev, newToast]);

        // Auto-hide if enabled
        if (defaultOptions.autoHide && defaultOptions.duration) {
            setTimeout(() => {
                closeFunction();
            }, defaultOptions.duration);
        }

        return toastId;
    };

    // Manage scroll behavior when dialogs open/close
    useEffect(() => {
        if (dialogStack.length > 0) {
            // First dialog opened - disable scrolling and save position
            if (dialogStack.length === 1) {
                scrollPositionRef.current = window.scrollY;
                disableScroller();
            }
        } else {
            // All dialogs closed - enable scrolling and restore position
            enableScroller();
            window.scrollTo({
                top: scrollPositionRef.current,
                behavior: 'instant'
            });
        }
    }, [dialogStack.length]);

    const contextValue: PromiseDialogContextType = {
        openDialog,
        addToast
    };

    return (
        <PromiseDialogContext.Provider value={contextValue}>
            {children}
            
            {/* Render dialog stack */}
            {dialogStack.map((dialog, index) => (
                <DialogOverlay 
                    key={dialog.id}
                    isVisible={index === dialogStack.length - 1} // Only show the topmost dialog
                    zIndex={10100 + index} // Stack dialogs above SlidingDrawer (which uses ~10000)
                    onBackdropClick={() => {
                        // Optional: close dialog when clicking backdrop
                        // dialog.resolve(undefined);
                        // setDialogStack(prev => prev.filter(d => d.id !== dialog.id));
                    }}
                >
                    {dialog.content}
                </DialogOverlay>
            ))}
            
            {/* Render toast stack */}
            {toastStack.length > 0 && (
                <ToastContainer toasts={toastStack} closeFunctions={toastCloseFunctions.current} />
            )}
        </PromiseDialogContext.Provider>
    );
};

interface DialogOverlayProps {
    children: ReactNode;
    isVisible: boolean;
    zIndex: number;
    onBackdropClick?: () => void;
}

const DialogOverlay: React.FC<DialogOverlayProps> = ({ 
    children, 
    isVisible, 
    zIndex, 
    onBackdropClick 
}) => {
    if (!isVisible) return null;

    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            backgroundColor="rgba(0, 0, 0, 0.5)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            padding="1rem"
            style={{ zIndex }}
            onClick={(e: React.MouseEvent) => {
                if (e.target === e.currentTarget && onBackdropClick) {
                    onBackdropClick();
                }
            }}
        >
            <Box
                backgroundColor="white"
                borderRadius="8px"
                boxShadow="0 10px 25px rgba(0, 0, 0, 0.2)"
                maxHeight="90vh"
                overflow="auto"
                width={'100%'}
                maxWidth={'500px'}
                style={{
                    animation: isVisible ? 'dialogFadeIn 0.2s ease-out' : 'dialogFadeOut 0.2s ease-out'
                }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {children}
            </Box>
            
            <style>{`
                @keyframes dialogFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                @keyframes dialogFadeOut {
                    from {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: scale(0.9) translateY(-10px);
                    }
                }
            `}</style>
        </Box>
    );
};

// Toast Container Component
interface ToastContainerProps {
    toasts: ToastState[];
    closeFunctions: Map<string, ToastCloseFunction>;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, closeFunctions }) => {
    return (
        <Box
            position="fixed"
            top="1rem"
            right="1rem"
            display="flex"
            flexDirection="column"
            gap="0.75rem"
            style={{ zIndex: 10200 }} // Above dialogs
            pointerEvents="none" // Let clicks pass through container
        >
            {toasts.map((toast) => (
                <ToastComponent 
                    key={toast.id} 
                    toast={toast}
                    onClose={() => {
                        const closeFunction = closeFunctions.get(toast.id);
                        if (closeFunction) {
                            closeFunction();
                        }
                    }}
                />
            ))}
        </Box>
    );
};

// Individual Toast Component
interface ToastComponentProps {
    toast: ToastState;
    onClose: () => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onClose }) => {
    const getToastConfig = () => {
        switch (toast.options.type) {
            case 'success':
                return {
                    icon: <FaCheckCircle />,
                    backgroundColor: '#d1fae5',
                    borderColor: '#059669',
                    iconColor: '#059669',
                    textColor: '#064e3b'
                };
            case 'warning':
                return {
                    icon: <FaExclamationTriangle />,
                    backgroundColor: '#fef3c7',
                    borderColor: '#d97706',
                    iconColor: '#d97706',
                    textColor: '#92400e'
                };
            case 'error':
                return {
                    icon: <FaExclamationCircle />,
                    backgroundColor: '#fee2e2',
                    borderColor: '#dc2626',
                    iconColor: '#dc2626',
                    textColor: '#991b1b'
                };
            default: // info
                return {
                    icon: <FaInfoCircle />,
                    backgroundColor: '#dbeafe',
                    borderColor: '#2563eb',
                    iconColor: '#2563eb',
                    textColor: '#1e3a8a'
                };
        }
    };

    const config = getToastConfig();

    return (
        <Box
            padding="1rem"
            backgroundColor={config.backgroundColor}
            border={`2px solid ${config.borderColor}`}
            borderRadius="8px"
            boxShadow="0 10px 25px rgba(0, 0, 0, 0.15)"
            display="flex"
            alignItems="flex-start"
            gap="0.75rem"
            minWidth="320px"
            maxWidth="420px"
            pointerEvents="auto" // Enable clicks on toast
            style={{
                animation: 'toastSlideIn 0.3s ease-out',
                transform: 'translateX(0)'
            }}
        >
            {/* Toast Icon */}
            <Box color={config.iconColor} fontSize="1.25rem" flexShrink={0} marginTop="0.125rem">
                {config.icon}
            </Box>

            {/* Toast Content */}
            <Box flex="1" color={config.textColor} fontSize="0.875rem" lineHeight="1.4">
                {toast.content}
            </Box>

            {/* Close Button */}
            {toast.options.showCloseButton && (
                <Button
                    label=""
                    icon={<FaTimes />}
                    onClick={onClose}
                    variant="normal"
                    size="small"
                    flexShrink={0}
                    backgroundColor="transparent"
                    border="none"
                    color={config.iconColor}
                    padding="0.25rem"
                    style={{
                        minWidth: 'unset',
                        height: '1.5rem',
                        width: '1.5rem'
                    }}
                />
            )}

            {/* Toast Animation Styles */}
            <style>{`
                @keyframes toastSlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </Box>
    );
};

export const usePromiseDialog = (): PromiseDialogContextType => {
    const context = useContext(PromiseDialogContext);
    if (!context) {
        throw new Error('usePromiseDialog must be used within a PromiseDialogProvider');
    }
    return context;
};

export default PromiseDialogProvider;