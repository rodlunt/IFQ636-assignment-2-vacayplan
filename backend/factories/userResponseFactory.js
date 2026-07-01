// DESIGN PATTERN - SIMPLE FACTORY - Centralises user response construction so authController and adminController each build their response shape in one place instead of inline.

class UserResponseFactory {
  static create(type, user, token = null) {
    if (type === 'auth') {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: !!user.isAdmin,
        token,
      };
    }

    if (type === 'admin') {
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: !!user.isAdmin,
        status: user.status,
      };
    }

    throw new Error(`UserResponseFactory: unknown type "${type}"`);
  }
}

module.exports = UserResponseFactory;
