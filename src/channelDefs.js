export default (Flex) => {
  const outboundChannel = Flex.DefaultTaskChannels.createCallTaskChannel('outbound-call', function(task) {
    console.log('TASK', task);
    return task.attributes.direction ===  'outbound';
  });

  console.log('outboundChannel', outboundChannel);
  Flex.TaskChannels.register(outboundChannel, true);
  console.log('done registration with chan def');
}
