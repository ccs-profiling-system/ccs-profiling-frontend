// Chair Portal Helper Functions
/**
 * Format approval status for display
 */
export function formatApprovalStatus(status) {
    switch (status) {
        case 'approved':
            return { label: 'Approved', variant: 'success' };
        case 'rejected':
            return { label: 'Rejected', variant: 'danger' };
        case 'pending':
            return { label: 'Pending', variant: 'warning' };
        default:
            return { label: status, variant: 'info' };
    }
}
/**
 * Format date for display
 */
export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
/**
 * Format time for display
 */
export function formatTime(time) {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}
/**
 * Format date and time together
 */
export function formatDateTime(datetime) {
    return new Date(datetime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}
/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {
    if (total === 0)
        return 0;
    return Math.round((value / total) * 100);
}
/**
 * Format number with commas
 */
export function formatNumber(num) {
    return num.toLocaleString('en-US');
}
/**
 * Get initials from name
 */
export function getInitials(firstName, lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return `${text.substring(0, maxLength)}...`;
}
/**
 * Get day of week from date
 */
export function getDayOfWeek(date) {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
}
/**
 * Check if date is in the past
 */
export function isPastDate(date) {
    return new Date(date) < new Date();
}
/**
 * Check if date is today
 */
export function isToday(date) {
    const today = new Date();
    const checkDate = new Date(date);
    return (checkDate.getDate() === today.getDate() &&
        checkDate.getMonth() === today.getMonth() &&
        checkDate.getFullYear() === today.getFullYear());
}
/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1)
        return 'Just now';
    if (diffMins < 60)
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7)
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(date);
}
/**
 * Download file from blob
 */
export function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix, extension) {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}-${timestamp}.${extension}`;
}
/**
 * Validate email format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Get status color class
 */
export function getStatusColor(status) {
    const colors = {
        active: 'text-green-600 bg-green-100',
        inactive: 'text-gray-600 bg-gray-100',
        pending: 'text-yellow-600 bg-yellow-100',
        approved: 'text-green-600 bg-green-100',
        rejected: 'text-red-600 bg-red-100',
        completed: 'text-blue-600 bg-blue-100',
        ongoing: 'text-orange-600 bg-orange-100',
        published: 'text-purple-600 bg-purple-100',
    };
    return colors[status.toLowerCase()] || 'text-gray-600 bg-gray-100';
}
/**
 * Sort array by key
 */
export function sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal)
            return order === 'asc' ? -1 : 1;
        if (aVal > bVal)
            return order === 'asc' ? 1 : -1;
        return 0;
    });
}
/**
 * Group array by key
 */
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}
/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
