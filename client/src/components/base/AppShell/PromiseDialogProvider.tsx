import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { DialogState, DialogContentFunction, PromiseDialogFunction, DialogCloseFunction } from './types';
import { Box } from '../Box';

interface PromiseDialogContextType {
    openDialog: PromiseDialogFunction;
}

const PromiseDialogContext = createContext<PromiseDialogContextType | undefined>(undefined);

interface PromiseDialogProviderProps {
    children: ReactNode;
}

export const PromiseDialogProvider: React.FC<PromiseDialogProviderProps> = ({ children }) => {
    const [dialogStack, setDialogStack] = useState<DialogState[]>([]);
    const dialogCounter = useRef(0);

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

    const contextValue: PromiseDialogContextType = {
        openDialog
    };

    return (
        <PromiseDialogContext.Provider value={contextValue}>
            {children}
            
            {/* Render dialog stack */}
            {dialogStack.map((dialog, index) => (
                <DialogOverlay 
                    key={dialog.id}
                    isVisible={index === dialogStack.length - 1} // Only show the topmost dialog
                    zIndex={1000 + index} // Stack dialogs with increasing z-index
                    onBackdropClick={() => {
                        // Optional: close dialog when clicking backdrop
                        // dialog.resolve(undefined);
                        // setDialogStack(prev => prev.filter(d => d.id !== dialog.id));
                    }}
                >
                    {dialog.content}
                </DialogOverlay>
            ))}
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

export const usePromiseDialog = (): PromiseDialogContextType => {
    const context = useContext(PromiseDialogContext);
    if (!context) {
        throw new Error('usePromiseDialog must be used within a PromiseDialogProvider');
    }
    return context;
};

export default PromiseDialogProvider;