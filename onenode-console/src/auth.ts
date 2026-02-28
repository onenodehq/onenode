import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import getUserByEmail from "./app/utils/user/getUserByEmail";
import createUser from "./app/utils/user/createUser";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
    async jwt({ token, profile }) {
      // parameters (apart from token) are only avalable upon signin
      if (profile) {
        const email = profile.email;
        const givenName = profile.given_name;
        const familyName = profile.family_name;
        const picutre = profile.picture;

        if (!(email && givenName && familyName && picutre)) {
          // error
          console.log("### information missing ###");
        } else {
          try {
            token.user = await getUserByEmail({ email: email });
            if (!token.user) {
              token.user = await createUser({
                email: email,
                givenName: givenName,
                familyName: familyName,
                picture: picutre,
              });
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
      return token;
    },
  },
  trustHost: true,
  pages: {
    signIn: "/auth/login",
  },
});
