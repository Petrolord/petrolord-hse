// @vitest-environment jsdom
// Batch 4B, owner-approved fix (e): a pick wrote the site name into the box,
// which ran the search again and reopened the result list. After a pick the
// list stays closed; typing again searches as before.
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

const HSE = { currentOrganization: { id: 'o1' } };
vi.mock('@/context/HSEContext', () => ({ useHSE: () => HSE }));
const search = vi.fn(async () => ([{ id: 's1', name: 'Gate 3 Yard', address: 'Onne' }]));
vi.mock('@/services/siteSearchService', () => ({ siteSearchService: { searchSites: (...a) => search(...a) } }));

const { default: LocationAutocomplete } = await import('@/components/sites/LocationAutocomplete');
const wait = (ms) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

describe('LocationAutocomplete after a pick (4B fix e)', () => {
  it('does not reopen the result list', async () => {
    const onSelect = vi.fn();
    render(<LocationAutocomplete onSelect={onSelect} />);
    const box = screen.getByPlaceholderText('Search for a site or location...');
    fireEvent.change(box, { target: { value: 'gate' } });
    await wait(400);
    fireEvent.click(await screen.findByText('Gate 3 Yard'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 's1' }));
    expect(box).toHaveValue('Gate 3 Yard');
    await wait(450);
    expect(screen.queryByText('Onne')).toBeNull();
    expect(search).toHaveBeenCalledTimes(1);
    // focusing the box again does not bring the picked list back
    fireEvent.focus(box);
    expect(screen.queryByText('Onne')).toBeNull();
    // typing again searches again
    fireEvent.change(box, { target: { value: 'gate 3' } });
    await wait(400);
    expect(search).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('Onne')).toBeInTheDocument();
  });
});
