/* eslint-disable react/prop-types */
const TextBox = ({
  value,
  handleMessageChange,
  handleKeyPress,
  placeholder
}) => {
  console.log('value', value);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      console.log('do validate');
      handleKeyPress();
    }
  };
  return (
    <>
      <input
        className="text-box"
        onKeyDown={handleKeyDown}
        onChange={handleMessageChange}
        placeholder={placeholder}
      />
      <button onClick={handleMessageChange} type="button">
        Send
      </button>
    </>
  );
};
export default TextBox;
