import toast from "react-hot-toast";

export const showToast = ({ type, message }: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => {
    const baseStyle = {
        borderRadius: '8px',
        padding: '10px 16px',
        fontWeight: 'bold',
    };

    const colorMap = {
        success: { background: '#16a34a', color: '#fff', icon: '✅' },
        error: { background: '#dc2626', color: '#fff', icon: '❌' },
        info: { background: '#2563eb', color: '#fff', icon: 'ℹ️' },
        warning: { background: '#eab308', color: '#000', icon: '⚠️' },
    };

    const { background, color, icon } = colorMap[type];
    toast(`${icon} ${message}`, { style: { ...baseStyle, background, color } });
};