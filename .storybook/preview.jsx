export default {
  decorators: [
    Story => (
      <div
        style={{
          width: '100%',
          height: 600,
        }}
      >
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
};
