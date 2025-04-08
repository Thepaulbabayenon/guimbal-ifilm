import { getFilmRating, getFilmWithUserData } from '../app/services/filmService';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ averageRating: 4.5 }),
  })
) as jest.Mock;

describe('filmService', () => {
  it('getFilmRating should return a promise with average rating', async () => {
    const filmId = '123';
    const ratingPromise = getFilmRating(filmId);
    expect(ratingPromise).toBeInstanceOf(Promise);

    const rating = await ratingPromise;
    expect(rating).toEqual({ averageRating: 4.5 });
  });

  it('getFilmWithUserData should return film data with user data', async () => {
    const filmId = '456';
    const userId = 'user123';
    const mockFilmData = {
      id: filmId,
      title: 'Test Film',
      watchlistStatus: true,
      userRating: 5,
    };

    mockedAxios.get.mockResolvedValue({ data: mockFilmData });

    const filmData = await getFilmWithUserData(filmId, userId);

    expect(mockedAxios.get).toHaveBeenCalledWith(`/api/films/${filmId}/details`, {
      params: { userId },
    });
    expect(filmData).toEqual(mockFilmData);
  });

  // Add more test cases here
});
