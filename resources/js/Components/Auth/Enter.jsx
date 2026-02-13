import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import AuthShell from '@/Components/Auth/AuthShell';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Enter({ mode = 'login', status, canResetPassword }) {
    const isRegister = mode === 'register';

    const loginForm = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const registerForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        referral: '',
    });

    const submit = (e) => {
        e.preventDefault();

        if (isRegister) {
            registerForm.post(route('register'), {
                onFinish: () =>
                    registerForm.reset('password', 'password_confirmation'),
            });
            return;
        }

        loginForm.post(route('login'), {
            onFinish: () => loginForm.reset('password'),
        });
    };

    const title = isRegister ? 'Criar conta' : 'Entrar';
    const switchLabel = isRegister ? 'Login' : 'Criar conta';
    const switchHref = isRegister ? route('login') : route('register');
    const description = isRegister
        ? 'Crie uma conta para sincronizar seu histórico e configurações.'
        : 'Entre com sua conta para acessar seus dados e configurações.';

    const currentForm = isRegister ? registerForm : loginForm;

    return (
        <AuthShell>
            <Head title={title} />

            <div className="flex items-center">
                <Link
                    href="/"
                    className="text-lg font-semibold tracking-tight text-white"
                >
                    <span className="text-emerald-400">Driver</span>{' '}
                    <span className="text-white">Pay</span>
                </Link>
            </div>

            <div className="mt-12">
                <div className="flex items-end justify-between gap-6">
                    <h1 className="text-[44px] font-bold leading-[1.05] tracking-tight text-white">
                        {title}
                    </h1>
                    <Link
                        href={switchHref}
                        className="pb-1 text-lg font-semibold text-slate-200 hover:text-white"
                    >
                        {switchLabel}
                    </Link>
                </div>
                <p className="mt-3 text-base leading-relaxed text-slate-400">
                    {description}
                </p>
            </div>

            {status && (
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200">
                    {status}
                </div>
            )}

            <div className="mt-9 rounded-[32px] border border-white/10 bg-[#0b1424]/70 p-8 shadow-2xl shadow-black/45 backdrop-blur">
                <form onSubmit={submit} className="space-y-6">
                    {isRegister && (
                        <div>
                            <label className="text-sm font-semibold tracking-widest text-slate-400">
                                NOME
                            </label>
                            <div className="mt-2 rounded-2xl border border-white/10 bg-[#0a1020]/70 px-5 py-4 shadow-inner shadow-black/30">
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={registerForm.data.name}
                                    className="w-full border-0 bg-transparent p-0 text-base text-slate-100 placeholder-slate-500 shadow-none focus:ring-0"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) =>
                                        registerForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    placeholder="Seu nome"
                                />
                            </div>
                            <InputError
                                message={registerForm.errors.name}
                                className="mt-2 text-red-400"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-semibold tracking-widest text-slate-400">
                            E-MAIL
                        </label>
                        <div className="mt-2 rounded-2xl border border-white/10 bg-[#0a1020]/70 px-5 py-4 shadow-inner shadow-black/30">
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={currentForm.data.email}
                                className="w-full border-0 bg-transparent p-0 text-base text-slate-100 placeholder-slate-500 shadow-none focus:ring-0"
                                autoComplete="username"
                                isFocused={!isRegister}
                                onChange={(e) =>
                                    currentForm.setData('email', e.target.value)
                                }
                                required
                                placeholder="voce@exemplo.com"
                            />
                        </div>
                        <InputError
                            message={currentForm.errors.email}
                            className="mt-2 text-red-400"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold tracking-widest text-slate-400">
                            SENHA
                        </label>
                        <div className="mt-2 rounded-2xl border border-white/10 bg-[#0a1020]/70 px-5 py-4 shadow-inner shadow-black/30">
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={currentForm.data.password}
                                className="w-full border-0 bg-transparent p-0 text-base text-slate-100 placeholder-slate-500 shadow-none focus:ring-0"
                                autoComplete={
                                    isRegister
                                        ? 'new-password'
                                        : 'current-password'
                                }
                                onChange={(e) =>
                                    currentForm.setData(
                                        'password',
                                        e.target.value,
                                    )
                                }
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <InputError
                            message={currentForm.errors.password}
                            className="mt-2 text-red-400"
                        />
                    </div>

                    {isRegister && (
                        <div>
                            <label className="text-sm font-semibold tracking-widest text-slate-400">
                                CONFIRMAR SENHA
                            </label>
                            <div className="mt-2 rounded-2xl border border-white/10 bg-[#0a1020]/70 px-5 py-4 shadow-inner shadow-black/30">
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={
                                        registerForm.data.password_confirmation
                                    }
                                    className="w-full border-0 bg-transparent p-0 text-base text-slate-100 placeholder-slate-500 shadow-none focus:ring-0"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        registerForm.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            <InputError
                                message={
                                    registerForm.errors.password_confirmation
                                }
                                className="mt-2 text-red-400"
                            />
                        </div>
                    )}

                    {isRegister && (
                        <div>
                            <label className="text-sm font-semibold tracking-widest text-slate-400">
                                INDICAÇÃO (OPCIONAL)
                            </label>
                            <div className="mt-2 rounded-2xl border border-white/10 bg-[#0a1020]/70 px-5 py-4 shadow-inner shadow-black/30">
                                <TextInput
                                    id="referral"
                                    name="referral"
                                    value={registerForm.data.referral}
                                    className="w-full border-0 bg-transparent p-0 text-base text-slate-100 placeholder-slate-500 shadow-none focus:ring-0"
                                    autoComplete="off"
                                    onChange={(e) =>
                                        registerForm.setData(
                                            'referral',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Ex.: joao-3F9A1C"
                                />
                            </div>
                            <p className="mt-2 text-sm text-slate-500">
                                Aceita com ou sem hífen, letras
                                maiúsculas/minúsculas e espaços.
                            </p>
                        </div>
                    )}

                    {!isRegister && (
                        <div className="flex items-center justify-between gap-4">
                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                <Checkbox
                                    name="remember"
                                    checked={loginForm.data.remember}
                                    onChange={(e) =>
                                        loginForm.setData(
                                            'remember',
                                            e.target.checked,
                                        )
                                    }
                                    className="border-white/20 bg-slate-950/30 text-emerald-400 focus:ring-emerald-500"
                                />
                                Lembrar de mim
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-medium text-slate-300 underline-offset-4 hover:text-white hover:underline"
                                >
                                    Esqueci a senha
                                </Link>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={currentForm.processing}
                        className="mt-1 w-full rounded-2xl bg-[#070b14]/60 px-6 py-5 text-left text-xl font-semibold text-white shadow-inner shadow-black/35 ring-1 ring-white/10 transition hover:bg-[#070b14]/75 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isRegister ? 'Criar conta' : 'Entrar'}
                    </button>
                </form>
            </div>
        </AuthShell>
    );
}
