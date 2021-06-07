let plugins = [];
if (process.env.NODE_ENV === 'development') plugins.push('react-refresh/babel');
module.exports = {
  presets: [
    '@babel/preset-env',
    [
      '@babel/preset-react',
      { runtime: 'automatic', debug: true, useBuiltIns: 'usage', corejs: 3 }
    ]
  ],
  plugins: plugins
};
