class Views::Greeting < Bridgetown::Component
  def initialize(name: "Mickey")
    @name = name
  end
end