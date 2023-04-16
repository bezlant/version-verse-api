export enum ERROR {
  AUTH,
  INPUT,
  INTERNAL,
}

export enum AUTH_ERROR {
  MISSING_USERNAME_PASSWORD = 'Missing username or password',
  USER_NOT_FOUND = 'User not found',
  INVALID_PASSWORD = 'Invalid Password',
}

export enum PRODUCT_ERROR {
  NOT_FOUND = 'Product not found',
}
