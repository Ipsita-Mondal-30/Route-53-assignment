from __future__ import annotations

import pytest

from app.services.bind_parser import (
    BindParseError,
    ensure_text_zone_file,
    parse_zone,
    qualify_name,
)

ORIGIN = "example.com."


def names(records: list) -> list[str]:
    return [record.name for record in records]


def test_qualify_relative_and_absolute_names() -> None:
    assert qualify_name("www", ORIGIN) == "www.example.com."
    assert qualify_name("@", ORIGIN) == "example.com."
    assert qualify_name("www.example.com.", ORIGIN) == "www.example.com."
    assert qualify_name("mail.other.org.", ORIGIN) == "mail.other.org."


def test_simple_a_record() -> None:
    records = parse_zone("www IN A 192.0.2.1", zone_origin=ORIGIN)
    assert len(records) == 1
    assert records[0].name == "www.example.com."
    assert records[0].type == "A"
    assert records[0].rdata == "192.0.2.1"
    assert records[0].ttl == 3600


def test_aaaa() -> None:
    records = parse_zone(
        "ipv6 IN AAAA 2001:db8::1",
        zone_origin=ORIGIN,
    )
    assert records[0].type == "AAAA"
    assert records[0].rdata == "2001:db8::1"


def test_cname() -> None:
    records = parse_zone(
        "www IN CNAME example.com.",
        zone_origin=ORIGIN,
    )
    assert records[0].type == "CNAME"
    assert records[0].rdata == "example.com."


def test_mx() -> None:
    records = parse_zone(
        "mail IN MX 10 mail.example.com.",
        zone_origin=ORIGIN,
    )
    assert records[0].type == "MX"
    assert records[0].rdata == "10 mail.example.com."


def test_txt_quoted() -> None:
    records = parse_zone(
        '@ IN TXT "v=spf1 include:example.com ~all"',
        zone_origin=ORIGIN,
    )
    assert records[0].name == "example.com."
    assert records[0].type == "TXT"
    assert records[0].rdata == '"v=spf1 include:example.com ~all"'


def test_ns() -> None:
    records = parse_zone(
        "@ IN NS ns-1.awsdns-00.com.",
        zone_origin=ORIGIN,
    )
    assert records[0].type == "NS"
    assert records[0].rdata == "ns-1.awsdns-00.com."


def test_soa() -> None:
    records = parse_zone(
        "@ IN SOA ns1.example.com. admin.example.com. 1 7200 3600 1209600 3600",
        zone_origin=ORIGIN,
    )
    assert records[0].type == "SOA"
    assert records[0].rdata.startswith("ns1.example.com. admin.example.com.")


def test_srv() -> None:
    records = parse_zone(
        "_sip._tcp IN SRV 10 5 5060 sip.example.com.",
        zone_origin=ORIGIN,
    )
    assert records[0].name == "_sip._tcp.example.com."
    assert records[0].type == "SRV"
    assert records[0].rdata == "10 5 5060 sip.example.com."


def test_caa() -> None:
    records = parse_zone(
        '@ IN CAA 0 issue "letsencrypt.org"',
        zone_origin=ORIGIN,
    )
    assert records[0].type == "CAA"
    assert records[0].rdata == '0 issue "letsencrypt.org"'


def test_ptr() -> None:
    records = parse_zone(
        "4.3.2.1.in-addr.arpa. IN PTR host.example.com.",
        zone_origin=ORIGIN,
    )
    assert records[0].name == "4.3.2.1.in-addr.arpa."
    assert records[0].type == "PTR"
    assert records[0].rdata == "host.example.com."


def test_origin_and_ttl_directives() -> None:
    text = """
$ORIGIN example.com.
$TTL 1h
www IN A 192.0.2.10
"""
    records = parse_zone(text, zone_origin="other.test.")
    assert records[0].name == "www.example.com."
    assert records[0].ttl == 3600


def test_comments_and_blank_lines() -> None:
    text = """
; zone header
$TTL 300

; A record
www IN A 192.0.2.1 ; trailing comment
"""
    records = parse_zone(text, zone_origin=ORIGIN)
    assert len(records) == 1
    assert records[0].rdata == "192.0.2.1"


def test_multiline_record() -> None:
    text = """
@ IN SOA ns1.example.com. hostmaster.example.com. (
    2024010101 ; serial
    7200       ; refresh
    3600       ; retry
    1209600    ; expire
    3600 )     ; minimum
"""
    records = parse_zone(text, zone_origin=ORIGIN)
    assert len(records) == 1
    assert records[0].type == "SOA"
    assert "2024010101" in records[0].rdata
    assert "3600" in records[0].rdata


def test_multiline_quoted_txt() -> None:
    text = """
@ IN TXT (
  "v=spf1 "
  "include:example.com ~all"
)
"""
    records = parse_zone(text, zone_origin=ORIGIN)
    assert records[0].rdata == '"v=spf1 include:example.com ~all"'


def test_relative_vs_absolute_names() -> None:
    text = """
$ORIGIN example.com.
www IN A 1.2.3.4
www.example.com. IN A 9.9.9.9
other.org. IN A 8.8.8.8
"""
    records = parse_zone(text, zone_origin="ignored.test.")
    assert records[0].name == "www.example.com."
    assert records[1].name == "www.example.com."
    assert records[2].name == "other.org."


def test_relative_cname_appends_origin() -> None:
    records = parse_zone(
        "$ORIGIN example.com.\nwww IN CNAME app",
        zone_origin=ORIGIN,
    )
    assert records[0].rdata == "app.example.com."


def test_omitted_owner_name() -> None:
    text = """
www IN A 192.0.2.1
    IN AAAA 2001:db8::1
"""
    records = parse_zone(text, zone_origin=ORIGIN)
    assert names(records) == ["www.example.com.", "www.example.com."]
    assert records[1].type == "AAAA"


def test_include_and_generate_rejected() -> None:
    with pytest.raises(BindParseError, match="not allowed"):
        parse_zone("$INCLUDE other.zone", zone_origin=ORIGIN)
    with pytest.raises(BindParseError, match="not allowed"):
        parse_zone("$GENERATE 1-10 $.example.com. IN A 1.2.3.$", zone_origin=ORIGIN)


def test_unclosed_paren_is_malformed() -> None:
    with pytest.raises(BindParseError, match="Unclosed parenthesis"):
        parse_zone("@ IN TXT ( \"hello\"", zone_origin=ORIGIN)


def test_unknown_directive() -> None:
    with pytest.raises(BindParseError, match="Unknown directive"):
        parse_zone("$FOO bar", zone_origin=ORIGIN)


def test_ensure_text_rejects_binary_and_oversize() -> None:
    with pytest.raises(BindParseError, match="binary"):
        ensure_text_zone_file("hello\x00world")
    with pytest.raises(BindParseError, match="UTF-8"):
        ensure_text_zone_file(b"\xff\xfe\x00\x00")
    with pytest.raises(BindParseError, match="size limit"):
        ensure_text_zone_file("a" * (256 * 1024 + 1))


def test_unknown_type_is_parsed_not_dropped() -> None:
    records = parse_zone("www IN NAPTR 10 10 u e2u foo.", zone_origin=ORIGIN)
    assert records[0].type == "NAPTR"
