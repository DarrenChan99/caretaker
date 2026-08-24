/**
 * Popo's replies go into the same relay_messages table as the family's, distinguished
 * only by this sender name. Everything else in the thread is "from family", which is
 * how her screen and the family thread tell the two directions apart without either
 * side hardcoding a particular family member's name.
 */
export const POPO_SENDER = "Popo";

export const isFromPopo = (senderNameEn: string) => senderNameEn === POPO_SENDER;
