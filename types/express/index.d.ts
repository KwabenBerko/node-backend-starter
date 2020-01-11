declare module Express {
    interface Request {
        currentUser: Partial<import ("../../src/user/user.model").UserModel>
    }
}