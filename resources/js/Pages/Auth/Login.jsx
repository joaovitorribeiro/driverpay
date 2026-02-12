import Enter from '@/Components/Auth/Enter';

export default function Login({ status, canResetPassword }) {
    return <Enter mode="login" status={status} canResetPassword={canResetPassword} />;
}
