class ApiClient
  def initialize
    client_id = ENV['github_client_id'] || CONFIG['github']['client_id']
    client_secret = ENV['github_client_secret'] || CONFIG['github']['client_secret']
    @client = Octokit::Client.new \
      :client_id     => "#{client_id}",
      :client_secret => "#{client_secret}"
    @client.auto_paginate = true
  end

  def get_commits(repo_url, params)
    begin
      commits = @client.commits(repo_url, params)
      parse_commits(commits)
    rescue
      commits = {}
    end
  end

  def get_contribs(repo_url, anon_param, params)
    begin
      contribs = @client.contribs(repo_url, anon_param, params)
      parse_contribs(contribs)
    rescue
      contribs = {}
    end
  end

  def get_repos(username, params)
    begin
      repos = @client.repositories(username, params)
      parse_repos(repos)
    rescue
      repos = {}
    end
  end

  private
  def parse_commits(commits)
    if commits.class == Array
      parsed_commits = commits.map do |commit|
        commit = {
          author: commit.author.login,
          date: commit.commit.committer.date,
          url: commit.html_url,
          sha: commit.sha
        }
      end
    else
      parsed_commits = {}
    end
  end

  def parse_contribs(contribs)
    if contribs.class == Array
      parsed_contribs = contribs.map do |contrib|
        contrib = {
          author: contrib.login,
          contributions: contrib.contributions
        }
      end
    else
      parsed_contribs = {}
    end
  end

  def parse_repos(repos)
    if repos.class == Array
      parsed_repos = repos.map do |repo|
        repo = {
          owner: repo.owner.login,
          name: repo.name,
          watches: repo.watchers_count,
          stars: repo.stargazers_count,
          forks: repo.forks_count}
      end
    else
      parsed_repos = {}
    end
  end
end