import React, {PropsWithChildren, useState} from "react";
import {useAppSelector} from "@/store";
import {selectIsAuthenticated} from "@/store/slices/authSlice.ts";
import {LoginForm} from "@/components/forms/LoginForm.tsx";
import {RegisterForm} from "@/components/forms/RegisterForm.tsx";

export const SecuredPage: React.FC<PropsWithChildren> = (props) => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [loginState, setLoginState] = useState<'login' | 'register' | 'resetPassword'>('login');
    if (!isAuthenticated) {
        if (loginState === 'login') {
            return <LoginForm onSwitchToRegister={() => setLoginState('register')} onSwitchToForgotPassword={() => {
            }}/>
        }
        if (loginState === 'register') {
            return <RegisterForm onSwitchToLogin={() => setLoginState('login')}/>
        }
    }
    return props.children
}