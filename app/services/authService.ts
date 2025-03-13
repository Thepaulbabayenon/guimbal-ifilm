let userDataPromise: Promise<any> | null = null;
let userData: any = null;

export function getUserData(): Promise<any> {
  // Return cached data if available
  if (userData) return Promise.resolve(userData);

  // Return existing promise if request is in flight
  if (userDataPromise) return userDataPromise;

  userDataPromise = fetch('/api/auth/user')
    .then(res => res.json())
    .then((data: any) => {
      userData = data;
      return data;
    })
    .finally(() => {
      userDataPromise = null;
    });

  return userDataPromise;
}
