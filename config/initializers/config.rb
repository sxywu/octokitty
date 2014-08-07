if File.exists?("#{Rails.root.to_s}/config/config.yml")
  CONFIG = YAML.load_file("#{Rails.root.to_s}/config/config.yml")[Rails.env] unless Rails.env.test?
end