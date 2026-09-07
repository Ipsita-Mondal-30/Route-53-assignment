from __future__ import annotations

from app.services.bind_export import (
    format_txt_rdata,
    fqdn,
    txt_logical_value,
    zone_filename,
)


def test_fqdn_and_filename() -> None:
    assert fqdn("Example.COM") == "example.com."
    assert fqdn("example.com.") == "example.com."
    assert zone_filename("Example.COM.", "json") == "example.com.json"
    assert zone_filename("Example.COM.", "zone") == "example.com.zone"


def test_txt_escaping_and_chunks() -> None:
    assert format_txt_rdata('"v=spf1 ~all"') == '"v=spf1 ~all"'
    assert format_txt_rdata(r'"say \"hello\""') == r'"say \"hello\""'
    assert txt_logical_value(r'"say \"hello\""') == 'say "hello"'
    long = "a" * 300
    rendered = format_txt_rdata(long)
    assert rendered.startswith('"')
    assert '" "' in rendered
    assert txt_logical_value(rendered.replace('" "', "")) == long
