import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "./components/Layout";
import { Button } from "./components/Button";
import { heading, paragraph, mutedText, buttonContainer } from "./components/styles";

interface WelcomeProps {
  loginUrl?: string;
  unsubscribeUrl?: string;
}

export const Welcome = ({
  loginUrl = "https://thalamus.sh/login",
  unsubscribeUrl = "https://thalamus.sh/unsubscribe?token=example",
}: WelcomeProps) => {
  return (
    <Layout preview="A note from the developer." unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>A note from the developer.</Text>

      <Text style={paragraph}>Hello there!</Text>

      <Text style={paragraph}>
        Thanks for signing up for Thalamus. I'm excited to have you on board! Thalamus is a first of
        its kind, and I'm thrilled to share it with you.
      </Text>

      <Text style={paragraph}>
        My commitment with Thalamus is that I will never require you to pay for features that should
        be free. The core functionality of Thalamus will always be available to all users at no
        cost, and you can check out the community edition on github for all features free of cost.
        The reason I offer a paid plan is to support the ongoing development and maintenance of
        Thalamus, ensuring that I can continue to improve and expand the platform for everyone.
      </Text>

      <Text style={paragraph}>
        If you have any feedback, feature requests, or just want to say hi, feel free to reply to
        this email. Your input helps shape the future of Thalamus. You can also check out the
        repository on <a href="https://github.com/justinlevine/thalamus">Github</a>.
      </Text>

      <Text style={paragraph}>
        Also, feel free to join the discord community to connect with other users.
      </Text>

      <Section style={buttonContainer}>
        <Button href={loginUrl}>Get Started</Button>
      </Section>

      <Text style={paragraph}>- Justin Levine, Developer of Thalamus</Text>

      <Text style={mutedText}>
        If you have any questions, you can reach out to me directly at
        <a href="mailto:heythalamus@fwdtojustin.com">heythalamus@fwdtojustin.com</a> or reply to
        this email. I'm here to help!
      </Text>
    </Layout>
  );
};

export default Welcome;
