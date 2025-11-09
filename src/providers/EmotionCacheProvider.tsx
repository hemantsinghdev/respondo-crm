import React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
export default function EmotionCacheProvider({children}: {children:React.ReactNode}){

    return (
        <AppRouterCacheProvider options={{key: "css"}}>
            {children}
        </AppRouterCacheProvider>
    )
}

