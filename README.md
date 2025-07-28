# RingCentral Softphone invite Call Queue Agent to Conference Demo

## User Story

A call agent is behind a call queue. We want to use the softphone SDK to make a
call to the call queue, once it was answered by the call agent, we would like to
bring the call agent into a conference.

## Setup

```
yarn install
```

Create `.env` file using `.env.sample` as template.

Edit `.env` and specify credentials.

## Run

```
yarn test
```

A outbound call will be made to the call queue number. Once the call is answered
by a call agent, the call agent will be brought into a conference.

The conference recording will be saved as a *.wav file in the current folder.
You may play the file to confirm that conference is working as expected:

```shell
play -t raw -b 16 -r 16000 -e signed-integer [file-name].wav
```

## Conclusion

If we make calls to an arbitrary number, we don't know if that number is a
regular number or a call queue number.

So it doesn't make sense to handle the call queue number differently. Just deem
it as a regular phone number.

We simply invite the call queue session to conference. Whichever agent answers
the call queue call will join the conference.
