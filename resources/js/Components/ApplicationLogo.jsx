export default function ApplicationLogo({
    className = '',
    alt = 'Driver Pay',
    ...props
}) {
    return (
        <img
            {...props}
            src="/assets/icon.png"
            alt={alt}
            className={(className ? className + ' ' : '') + 'object-contain'}
            draggable="false"
        />
    );
}
