module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false,         
        allowUndefined: true, // tolerate missing vars
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
