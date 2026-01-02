import React, { Component } from 'react';

interface State {
	hasError: boolean;
}

export class ErrorBoundary extends Component<React.PropsWithChildren<{}>, State> {
	// Explicit declarations to satisfy TS checker in this project setup
	public props!: React.PropsWithChildren<{}>;
	public state: State = { hasError: false };
	public setState: any;

	constructor(props: React.PropsWithChildren<{}>) {
		super(props);
	}

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: unknown, info: unknown) {
		// Optionally send to an error monitoring service here
		// console.error('Uncaught error:', error, info);
	}

	handleReload = () => {
		this.setState({ hasError: false });
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex items-center justify-center bg-night-900 text-ink-100 p-6">
					<div className="max-w-lg w-full bg-night-800 rounded-3xl border border-white/5 shadow-2xl p-8 text-center">
						<h2 className="text-2xl font-black mb-4">Something went wrong</h2>
						<p className="text-ink-300 mb-6">An unexpected error occurred. Reload to try again.</p>
						<div className="flex justify-center gap-4">
							<button onClick={this.handleReload} className="bg-popcorn text-night-900 font-black px-6 py-3 rounded-xl">Reload</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children as React.ReactElement;
	}
}

export default ErrorBoundary;
