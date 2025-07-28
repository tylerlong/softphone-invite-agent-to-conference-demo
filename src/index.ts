import RingCentral from "@rc-ex/core";
import Softphone from "ringcentral-softphone";
import fs from "fs";

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});

const softphone = new Softphone({
  outboundProxy: process.env.SIP_INFO_OUTBOUND_PROXY!,
  username: process.env.SIP_INFO_USERNAME!,
  password: process.env.SIP_INFO_PASSWORD!,
  authorizationId: process.env.SIP_INFO_AUTHORIZATION_ID!,
  domain: process.env.SIP_INFO_DOMAIN!,
});
softphone.enableDebugMode(); // optional, for debugging/testing

const main = async () => {
  // initialize
  await softphone.register();
  await rc.authorize({
    jwt: process.env.RINGCENTRAL_JWT_TOKEN!,
  });

  // create conference
  const r = await rc.restapi().account().telephony().conference().post();
  const confSession = await softphone.call(r.session!.voiceCallToken!);

  // optional: record conference audio, for debugging/testing
  const writeStream = fs.createWriteStream(`${confSession.callId}.wav`, {
    flags: "a",
  });
  confSession.on("audioPacket", (rtpPacket) => {
    writeStream.write(rtpPacket.payload);
  });
  confSession.once("disposed", () => {
    writeStream.close();
  });

  // call the call queue
  const inviteSession = await softphone.call(
    process.env.RINGCENTRAL_CALL_QUEUE_NUMBER!,
  );
  inviteSession.once("answered", async () => {
    // invite the call queue session to the conference
    // whoever answers the call queue call will be joining the conference
    await rc
      .restapi()
      .account()
      .telephony()
      .sessions(confSession.sessionId)
      .parties()
      .bringIn()
      .post({
        sessionId: inviteSession.sessionId,
        partyId: inviteSession.partyId,
      });

    // optional, we do not need REST API token after this point
    await rc.revoke();
  });
};

main();
