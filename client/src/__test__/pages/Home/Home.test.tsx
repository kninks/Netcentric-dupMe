import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '../../../pages/Home/Home';
import { MemoryRouter } from "react-router-dom";


describe('renders Home page correctly', () => {
    it('should render initial components correctly', () => {
        render(
            <MemoryRouter> {/* Wrap Home in MemoryRouter */}
                <Home />
            </MemoryRouter>
        );
        const howToPlayButton = screen.getByTestId('how-to-play-button');
        expect(howToPlayButton).toBeInTheDocument();
    });
});