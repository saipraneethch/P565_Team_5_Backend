/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useCourseGrades } from '../hooks/useCourseGrades';
import fetchMock from 'jest-fetch-mock';

describe('useCourseGrades', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('initial state', () => {
    const { result } = renderHook(() => useCourseGrades());

    expect(result.current.grades).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('loads grades successfully', async () => {
    const grades = [{ id: 1, grade: 'A' }, { id: 2, grade: 'B' }];
    fetchMock.mockResponseOnce(JSON.stringify(grades));

    const { result, waitForNextUpdate } = renderHook(() => useCourseGrades());

    act(() => {
      result.current.fetchCourseGrades();
    });

    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.grades).toEqual(grades);
    expect(result.current.error).toBe(null);
  });

  it('handles fetch error', async () => {
    fetchMock.mockReject(new Error('Network error. Please try again.'));

    const { result, waitForNextUpdate } = renderHook(() => useCourseGrades());

    act(() => {
      result.current.fetchCourseGrades();
    });

    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Network error. Please try again.');
    expect(result.current.grades).toEqual([]);
  });

  it('handles non-ok response', async () => {
    const errorMessage = { error: 'Error fetching grades' };
    fetchMock.mockResponseOnce(JSON.stringify(errorMessage), { status: 404 });

    const { result, waitForNextUpdate } = renderHook(() => useCourseGrades());

    act(() => {
      result.current.fetchCourseGrades();
    });

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage.error);
    expect(result.current.grades).toEqual([]);
  });
});
