import { v4 as uuidv4 } from 'uuid';

export const USER_AGENT = 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:71.0) Gecko/20100101 Firefox/71.0';

const sessionData = {
  cookies: null,
  clientId: uuidv4(),
};

export default sessionData;
