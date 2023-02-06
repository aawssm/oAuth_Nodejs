class OAuthToUserPofile {
  providerToProfile(profile, provider) {
    switch (provider) {
      case "google":
        return this.gooleToProfile(profile);
      case "github":
        return this.githubToProfile(profile);
      case "linkedin":
        return this.linkedinToProfile(profile);
      case "microsoft":
        return this.microsoftToProfile(profile);
      case "facebook":
        return this.facebookToProfile(profile);
      case "slack":
        return this.slackToProfile(profile);
      case "twitter":
        return this.twitterToProfile(profile);

      default:
        return profile;
    }
  }
  gooleToProfile(input, user = {}) {
    const { accessToken, refreshToken, profile, provider } = input;
    user.name = profile.name.givenName + " " + profile.name.familyName;
    user.givenName = profile.name.givenName;
    user.middleName = "";
    user.familyName = profile.name.familyName;
    user.email = profile.emails[0].value;
    user.isVerified = profile._json.email_verified || false;
    user.profilePic = profile.photos[0].value;
    user.providers = user.providers || [];
    user.providers.push({
      provider,
      accessToken,
      refreshToken,
      id: profile.id,
      username: profile.displayName,
      email: profile.emails[0].value,
      isVerified: profile._json.email_verified || false,
    });
    return user;
  }
  githubToProfile(input, user = {}) {
    const { accessToken, refreshToken, profile, provider } = input;
    user.name = profile.displayName || profile.username;
    user.username = profile.username;
    user.email =
      profile.email || profile.apiEmail || `${profile.username}@${provider}`;
    user.isVerified = profile.apiEmailVerify || false;
    user.profilePic = profile.photos[0].value;
    user.providers = user.providers || [];
    user.providers.push({
      provider,
      accessToken,
      refreshToken,
      id: profile.id,
      username: profile.username,
      email:
        profile.email || profile.apiEmail || `${profile.username}@${provider}`,
      isVerified: profile.apiEmailVerify || false,
    });
    return user;
  }
  linkedinToProfile(input, user = {}) {
    const { accessToken, refreshToken, profile, provider } = input;
    const { id, name, displayName, emails, photos } = profile;
    user.name = displayName;
    user.givenName = name.givenName;
    user.familyName = name.familyName;
    user.email =
      emails[0].value || `${displayName.replaceAll(" ", "")}@${provider}.com`;
    user.isVerified = null;
    user.profilePic = photos[photos.length - 1].value;

    user.providers = user.providers || [];
    user.providers.push({
      accessToken,
      refreshToken,
      provider,
      id,
      email:
        emails[0].value || `${displayName.replaceAll(" ", "")}@${provider}.com`,
      isVerified: null,
    });

    return user;
  }
  microsoftToProfile(profile, user) {
    //TODO: to be implimented
  }
  facebookToProfile(profile, user) {
    //TODO: to be implimented
  }
  slackToProfile(profile, user) {
    //TODO: to be implimented
  }
  twitterToProfile(profile, user) {
    //TODO: to be implimented
  }
  extractUsername(email) {
    return email.split("@")[0];
  }
  updateUser(oldUser, newUser) {
    console.log("multioauth old new");
    console.log(oldUser.provider);
    console.log(newUser.provider);
    let updatedUser = { ...oldUser };

    for (let key in newUser) {
      if (newUser[key] && !oldUser[key]) {
        updatedUser[key] = newUser[key];
      }
    }
    const index = updatedUser.providers.findIndex(
      (old) => old.provider === newUser.providers[0].provider
    );
    console.log(index, newUser.providers[0].provider);
    if (index === undefined || index === -1)
      updatedUser.providers.push(newUser.providers[0]);
    else updatedUser.providers[index] = newUser.providers[0];

    if (!oldUser.isVerified && newUser.isVerified) {
      updatedUser.isVerified = newUser.isVerified;
      updatedUser.email = newUser.email;
    }
    updatedUser.name = updatedUser.givenName;
    updatedUser.name =
      updatedUser.name +
      (!updatedUser.middleName ? "" : " " + updatedUser.middleName);
    updatedUser.name =
      updatedUser.name +
      (!updatedUser.familyName ? "" : " " + updatedUser.familyName);
    updatedUser.name =
      updatedUser.name ||
      updatedUser.username ||
      this.extractUsername(updatedUser.email);
    return updatedUser;
  }
}
module.exports = new OAuthToUserPofile();
