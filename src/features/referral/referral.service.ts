import User, { UserDocument } from "@/models/User";
import logger from "@/utils/Logger";
import { IReferredUser } from "./referral.types";

export interface IReferralDetails {
    referredUsers: IReferredUser[];
    url: string;
    bannerCodeString: string;
    defaultRefMessage: string;
}

export class ReferralService {
    public async getReferralDetails(user: UserDocument): Promise<IReferralDetails> {
        const referredUsersList: IReferredUser[] = [];
        try {
            const referred = await User.find({ referredBy: user._id });
            for (const ref of referred) {
                referredUsersList.push({ user: ref.username, income: 0 });
            }
        } catch (error) {
            logger.error(`Failed to fetch referred users for ${user.username}`, { error });
        }

        const referralUrl = `https://start.protanki-game.com/?refId=${user.referralHash}`;
        const bannerCode = `<iframe src="http://s.pro-tanki.com/refbanner/index.html?hash=${user.referralHash}" width="953" height="255" style="border:none;"></iframe>`;
        const defaultMessage = "";

        return {
            referredUsers: referredUsersList,
            url: referralUrl,
            bannerCodeString: bannerCode,
            defaultRefMessage: defaultMessage,
        };
    }
}