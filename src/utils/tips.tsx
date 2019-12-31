import { toast } from "react-toastify";

import { Icon, Stack, Text } from "@chakra-ui/core";

export const tagTips: string[] = [
  "Tip en construcción 1",
  "Tip en construcción 2",
  "Tip en construcción 3",
  "Tip en construcción 4",
];

export const imageTips: string[] = [
  "Tip en construcción 1",
  "Tip en construcción 2",
  "Tip en construcción 3",
  "Tip en construcción 4",
];

const tipNLimit = 10;

const counters = {
  tags: tipNLimit,
  images: tipNLimit,
};

export const tipAnswerTag = () => {
  const tagsAnswered = (counters.tags += 1);
  if (tagsAnswered >= tipNLimit) {
    counters.tags = 0;
    const tip = tagTips[0];
    if (tip) {
      tagTips.splice(0, 1);
      toast(
        <Stack isInline alignItems="center">
          <Icon size="2em" name="info" />
          <Text fontSize="2em">{tip}</Text>
        </Stack>,
        {
          type: "info",
        }
      );
    }
  }
};
export const tipAnswerImage = () => {
  const imagesAnswered = (counters.images += 1);
  if (imagesAnswered >= tipNLimit) {
    counters.images = 0;
    const tip = imageTips[0];
    if (tip) {
      imageTips.splice(0, 1);
      toast(
        <Stack isInline alignItems="center">
          <Icon size="2em" name="info" />
          <Text fontSize="2em">{tip}</Text>
        </Stack>,
        {
          type: "info",
        }
      );
    }
  }
};
