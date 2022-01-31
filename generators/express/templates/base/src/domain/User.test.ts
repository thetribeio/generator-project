import { User } from './User';

test('checkPassword return true on valid password', async () => {
    const user = new User('test@example.com');

    await user.updatePassword('Pas$w0rd');

    expect(await user.checkPassword('Pas$w0rd')).toBe(true);
});

test('checkPassword return false on valid password', async () => {
    const user = new User('test@example.com');

    await user.updatePassword('Pas$w0rd');

    expect(await user.checkPassword('Wrong')).toBe(false);
});
