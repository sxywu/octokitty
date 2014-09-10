class Response < ActiveRecord::Base
  set_primary_key :username
  attr_accessible :username, :response, :data

  def fetch
    Delayed::Job.enqueue self
  end

  def perform
    json = {}
    json[:users] = []
    json[:repos] = []
    json[:commits] = []

    user = fetch_user(self.username, json)

    user.contributions.where(:owns => true).each do |contribution|
      # find all repos user owns
      Repo.find(contribution.repo_id).contributions.where(:owns => false).each do |contribution|
        # find all contributors to the repo
        fetch_user(contribution.contributor, json)
      end
    end

    self.data = json.to_json
    self.response = true
    self.save
  end

  def error
    self.response = false
    self.save
  end

  def failure
    self.response = false
    self.save
  end

  private
  def fetch_user(username, json)
    user = User.find_by_username(self.username)

    if user
      # user already exists
      user.fetch

      json[:users] << user

      # after fetching, fetch user's repos
      fetch_user_repos(user, json)

    else
      # user does not exist, create and then fetch
      user = User.create(username: self.username)
      user.fetch

      fetch_user_repos(user, json)
    end

    return user
  end

  def fetch_user_repos(user, json)
    user.contributions.where(:owns => true).each do |contribution|
      repo = Repo.find(contribution.repo_id)
      repo.fetch

      if repo.contributions.count > 1
        json[:repos] << repo.parse_for_render

        # fetch all commits by contributors to repo
        repo.contributions.each do |contribution|
          commit = Commit.find_by_contributor_and_repo_id(contribution.contributor, contribution.repo_id)
          commit.fetch

          json[:commits] << commit.parse_for_render
        end
      else
        # if the repo doesn't have any contributors
        # first delete references to the contribution in user and repo
        # then delete contribution
        # then delete the repo
        repo.contributions.delete(repo.contributions.first)
        user.contributions.delete(contribution)
        contribution.destroy
        repo.destroy
      end

    end
  end

end