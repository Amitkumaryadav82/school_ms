export interface SchoolProfile {
	name: string;
	addressLine1?: string;
	addressLine2?: string;
	phone?: string;
	email?: string;
	logoUrl?: string;
}

const env = (import.meta as any).env || {};

let schoolProfile: SchoolProfile;
const stored = typeof window !== 'undefined' ? localStorage.getItem('schoolProfile') : null;
if (stored) {
	try {
		schoolProfile = JSON.parse(stored);
	} catch {
		schoolProfile = {
			name: env.VITE_SCHOOL_NAME || 'SCHOOL MANAGEMENT SYSTEM',
			addressLine1: env.VITE_SCHOOL_ADDRESS_LINE1 || '123 Education Street, City, Country',
			addressLine2: env.VITE_SCHOOL_ADDRESS_LINE2 || undefined,
			phone: env.VITE_SCHOOL_PHONE || '+91 1234567890',
			email: env.VITE_SCHOOL_EMAIL || 'info@schoolms.com',
			logoUrl: env.VITE_SCHOOL_LOGO_URL || undefined,
		};
	}
} else {
	schoolProfile = {
		name: env.VITE_SCHOOL_NAME || 'SCHOOL MANAGEMENT SYSTEM',
		addressLine1: env.VITE_SCHOOL_ADDRESS_LINE1 || '123 Education Street, City, Country',
		addressLine2: env.VITE_SCHOOL_ADDRESS_LINE2 || undefined,
		phone: env.VITE_SCHOOL_PHONE || '+91 1234567890',
		email: env.VITE_SCHOOL_EMAIL || 'info@schoolms.com',
		logoUrl: env.VITE_SCHOOL_LOGO_URL || undefined,
	};
}

export default schoolProfile;
