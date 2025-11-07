
import React, { useState } from 'react';

interface LoginScreenProps {
    onLogin: (username: string, password: string) => boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onLogin(username, password);
        if (!success) {
            setError('Invalid username or password.');
        } else {
            setError('');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-lg">
                <div className="flex flex-col items-center">
                     <div className="bg-cyan-500 p-3 rounded-lg mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a48,48,0,0,1-48,48,46.58,46.58,0,0,1-13.45-2.24,8,8,0,0,1,4-15.45,32,32,0,1,0,0-60.62,8,8,0,1,1,4-15.45A46.58,46.58,0,0,1,128,80,48,48,0,0,1,176,128Z"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">GAB Financial Solutions</h1>
                    <p className="mt-2 text-gray-400">Please sign in to continue</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm rounded-t-md"
                                placeholder="Username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password"className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm rounded-b-md"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-center text-sm text-red-400">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;