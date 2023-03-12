import { AuthManager } from './auth.manager.js';

const manager = new AuthManager();

export const validateUserInput = (formElement: HTMLFormElement): (() => void) => {
  return () => {
    const email: string = formElement.email.value;
    const emailError = document.getElementById('emailError') as HTMLFormElement;
    manager.checkEmail(email, emailError);

    const passwordError = document.getElementById('passwordError') as HTMLFormElement;
    const password: string = formElement.password.value;
    manager.checkPassword(password, passwordError);
  };
};

export const signUp = async (event: Event): Promise<void> => {
  event.preventDefault();
  const { email, password } = await manager.getCredentialsFromEvent(event);
  await manager.authUser(email, password, 'signup');
};

export const logIn = async (event: Event): Promise<void> => {
  event.preventDefault();
  const { email, password } = await manager.getCredentialsFromEvent(event);
  await manager.authUser(email, password, 'login');
};
