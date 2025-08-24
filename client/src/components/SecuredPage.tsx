import React, {PropsWithChildren, useState} from "react";
import {useAppSelector} from "@/store";
import {selectIsAuthenticated} from "@/store/slices/authSlice.ts";
import {LoginForm} from "@/components/forms/LoginForm.tsx";
import {RegisterForm} from "@/components/forms/RegisterForm.tsx";
import {Box} from "@/components/base/Box.tsx";

export const SecuredPage: React.FC<PropsWithChildren> = (props) => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [loginState, setLoginState] = useState<'login' | 'register' | 'resetPassword'>('login');
    if (!isAuthenticated) {
        return <Box display={'flex'} flexDirection={'column'} paddingY={'2rem'} >
            {loginState === 'login' && <LoginForm onSwitchToRegister={() => setLoginState('register')} onSwitchToForgotPassword={() => {
            }}/>}
            {loginState === 'register' && <RegisterForm onSwitchToLogin={() => setLoginState('login')}/>}
        </Box>

    }
    return props.children
}