# Rename this file to hello.rb to try it out

class Routes::Hello < Bridgetown::Rack::Routes
  route do |r|
    # route: GET /hello/:name
    r.get "hello", String do |name|
      render Views::Greeting.new(name: name)
    end
  end
end
