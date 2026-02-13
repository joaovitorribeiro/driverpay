import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import SplashScreen from './Components/SplashScreen';

const appName = import.meta.env.VITE_APP_NAME || 'Driver Pay';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        function Root() {
            const [showSplash, setShowSplash] = useState(true);

            return (
                <>
                    {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
                    <App {...props} />
                </>
            );
        }

        root.render(<Root />);
    },
    progress: {
        color: '#4B5563',
    },
});
