import { Convoy, Member, ConvoyParticipant } from "@prisma/client";

export type TConvoyWithRelations = Convoy & {
  createdBy: Member;
  participants: (ConvoyParticipant & {
    member: Member;
  })[];
};