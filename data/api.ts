import { Exercise } from '../types';
import { RAPIDAPI_KEY, EXERCISEDB_CONFIG } from '../constants';

/**
 * Construct the authenticated image URL for an exercise
 * RapidAPI ExerciseDB v2 requires API key for image access
 * Format: /image?exerciseId={id}&resolution={size}&rapidapi-key={key}
 */
function getImageUrl(exerciseId: string): string {
  // Use 180px resolution (available on all tiers including BASIC)
  return `${EXERCISEDB_CONFIG.baseUrl}/image?exerciseId=${exerciseId}&resolution=180&rapidapi-key=${RAPIDAPI_KEY}`;
}

/**
 * Search exercises by name using RapidAPI ExerciseDB
 * Returns partial matches from ExerciseDB API
 */
export async function searchExercises(query: string): Promise<Exercise[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `${EXERCISEDB_CONFIG.baseUrl}/exercises/name/${encodeURIComponent(query.toLowerCase())}?limit=20`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': EXERCISEDB_CONFIG.host,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Debug: Log raw API response
    if (data.length > 0) {
      console.log('[ExerciseDB] Raw API response (first item):', JSON.stringify(data[0], null, 2));
    }

    // Map API response to our Exercise type
    // RapidAPI ExerciseDB returns: id, name, bodyPart, target, equipment, secondaryMuscles, gifUrl, instructions
    // We construct the image URL with API key since the /image endpoint requires authentication
    return data.map((item: Record<string, unknown>) => {
      const id = item.id as string;
      const exercise = {
        id,
        name: item.name as string,
        bodyPart: item.bodyPart as string,
        target: item.target as string,
        secondaryMuscles: (item.secondaryMuscles as string[]) || [],
        equipment: item.equipment as string,
        gifUrl: getImageUrl(id),
      };
      console.log('[ExerciseDB] Mapped exercise:', exercise.name, '-> gifUrl:', exercise.gifUrl, '-> secondaryMuscles:', exercise.secondaryMuscles);
      return exercise;
    });
  } catch (error) {
    console.error('Failed to search exercises:', error);
    throw error;
  }
}

/**
 * Get a single exercise by ID
 */
export async function getExerciseById(id: string): Promise<Exercise | null> {
  try {
    const response = await fetch(
      `${EXERCISEDB_CONFIG.baseUrl}/exercises/exercise/${id}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': EXERCISEDB_CONFIG.host,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    const item = await response.json();

    if (!item) return null;

    const exerciseId = item.id as string;
    return {
      id: exerciseId,
      name: item.name as string,
      bodyPart: item.bodyPart as string,
      target: item.target as string,
      secondaryMuscles: (item.secondaryMuscles as string[]) || [],
      equipment: item.equipment as string,
      gifUrl: getImageUrl(exerciseId),
    };
  } catch (error) {
    console.error('Failed to get exercise:', error);
    throw error;
  }
}
