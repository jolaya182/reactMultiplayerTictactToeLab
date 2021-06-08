let plugins = [];
if (process.env.NODE_ENV === 'development') plugins.push('react-refresh/babel');
module.exports = {
  presets: [
    ['@babel/preset-env', { 'debug': true, 'useBuiltIns': 'usage', 'corejs': 3.14 }],

    [
      '@babel/preset-react',
      { 'runtime': 'automatic' }
    ]
  ],
  plugins: plugins
};
