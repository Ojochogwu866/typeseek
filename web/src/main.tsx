import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'locomotive-scroll/dist/locomotive-scroll.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import Home from './Home.tsx';
import Search from './Search.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/search" element={<Search />} />
				</Routes>
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>
);
