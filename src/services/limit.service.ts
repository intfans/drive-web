import { getHeaders } from '../lib/auth';

/**
 * Calls drive API to get Storage limit of a client
 * @param {String} maxCalls - Max number of API calls that it can be made (Default 5 calls)
 *
 */
function fetchLimit(isTeam: boolean, maxCalls : number = 5): Promise<number> {
  return fetch('/api/limit', {
    method: 'get',
    headers: getHeaders(true, false, isTeam)
  }).then(res => {
    if (res.status !== 200) {
      throw res;
    }
    return res.json();
  }).then(res1 => {
    return res1.maxSpaceBytes;
  }).catch(err => {
    if (maxCalls > 0) {
      return fetchLimit(isTeam, maxCalls - 1);
    }

    console.log('Error getting /api/limit for App', err);
  });
}

const limitService = {
  fetchLimit
};

export default limitService;