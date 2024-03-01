module.exports = {
  transform: {
    '^.+\\.[tj]sx?$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true,
          dynamicImport: true
        },
        transform: {
          legacyDecorator: false,
          decoratorMetadata: false,
          decoratorVersion: '2022-03',
        },
      },
    }],
  },
};
