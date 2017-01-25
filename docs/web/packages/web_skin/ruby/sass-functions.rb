module Sass::Script::Functions
  # Inspects the unit of the number, returning the number only
  # @param string [String] The number to inspect
  # @return [Literal] The number without its unit
  def value(string)
    Sass::Script::Number.new(string.value)
  end
  declare :value, [:string]

  def to_int(string)
    Sass::Script::Number.new(string.value.to_i)
  end
  declare :to_int, [:string]

  def to_float(string)
    Sass::Script::Number.new(string.value.to_f)
  end
  declare :to_float, [:string]

  # outputs a stringified version of the `&` Sass operator
  def selector_string()
    return Sass::Script::String.new(environment.selector.to_s)
  end

  def split(string, key)
    items = string.value.split(key.value)
    if items.count == 1
      Sass::Script::String.new(string.to_s)
    else
      Sass::Script::List.new(items.map{|i| Sass::Script::String.new(i)}, :space)
    end
  end
  declare :split, [:string, :string]
end
