export {};

interface GoogleCredentialResponse {
	credential: string;
}

interface GoogleIdConfiguration {
	client_id: string;
	callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleButtonOptions {
	theme?: 'outline' | 'filled_blue' | 'filled_black';
	size?: 'small' | 'medium' | 'large';
	shape?: 'rectangular' | 'pill' | 'circle' | 'square';
	text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (config: GoogleIdConfiguration) => void;
					renderButton: (
						parent: HTMLElement,
						options: GoogleButtonOptions
					) => void;
				};
			};
		};
	}
}
