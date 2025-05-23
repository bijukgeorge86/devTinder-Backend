const cronjob = require("node-cron");
const ConnectionRequestModel = require("../models/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("../aws/sendEmail");

// This cron job will run at 3 AM in the morning everyday.
cronjob.schedule("0 3 * * *", async () => {
    // Send Email to all people who got request yesterday
    console.log("Hello World" + new Date());
    try {
        const yesterday = subDays(new Date(), 1);

        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);

        const pendingRequests = await ConnectionRequestModel.find({
            status: "interested",
            createdAt: {
                $gte: yesterdayStart,
                $lt: yesterdayEnd,
            },
        }).populate("fromUserId toUserId");

        const listOfEmails = [
            ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
        ];
        for (const email of listOfEmails) {
            //Send Emails
            try {
                //console.log(listOfEmails);

                const res = await sendEmail.run(
                    "New Friend Request Pending for " + email,
                    "There are too many friend requests pending, please login to your account in mydevTinder.live and please accept or reject requests."
                );
                //console.log(res);
            } catch (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    }
});
