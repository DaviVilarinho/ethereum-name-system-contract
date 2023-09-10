// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

/*
registerDomain(string newDomain) 
setValue("TOPICOS", "ivan") faz ENS["TOPICOS"]["ivan"] = msg.sender
getValue(string domain, address a) returns (string) QUANDO ENS["TOPICOS"][RET] = msg.sender
getValue(string domain, value v) returns (address) QUANDO ENS["TOPICOS"][v] addressRetornado
*/
contract ENS {
    address owner;
    mapping(string => Domain) ENS;
    uint baseFee; // este é o custo de máximo: 1 caractere.

    struct Domain {
        bool initialized; // marca que o owner já inicializou
        mapping(string => address) addressByValue;
        mapping(address => string) valuesByAddress;
    }

    constructor(uint fee) {
        owner = msg.sender;
        baseFee = fee;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "so o dono pode registrar");
        _;
    }

    function registerDomain(string memory domain) public onlyOwner {
        ENS[domain].initialized = true; // seta iniciado para garantir em setvalues
    }

    function requireExistentDomain(string memory domain) private view {
        // como não modifica é view
        require(ENS[domain].initialized, "Dominio inexistente");
    }

    function isNotSetValue(
        string memory domain,
        string memory value
    ) private view returns (bool) {
        return ENS[domain].addressByValue[value] == address(0);
    }

    function getWeiNeed(string memory name) private view returns (uint) {
        return uint(baseFee / bytes(name).length); // o custo cai com mais caracteres
    }

    function setValue(
        string memory domain,
        string memory value
    ) public payable {
        requireExistentDomain(domain);
        require(
            keccak256(abi.encode(value)) != keccak256(""),
            "Nao pode setar string vazia!"
        );
        require(
            isNotSetValue(domain, value),
            "Ja existe uma relacao com o value"
        );
        require(
            getWeiNeed(value) <= msg.value,
            "Voce deve pagar de acordo com o inverso do tamanho do nome."
        );
        ENS[domain].addressByValue[value] = msg.sender;
        ENS[domain].valuesByAddress[msg.sender] = value;
    }

    function getValue(
        string memory domain,
        address domainOwner
    ) public view returns (string memory) {
        // como não modifica é view
        requireExistentDomain(domain);
        string memory valueFromMap = ENS[domain].valuesByAddress[domainOwner]; // encontra o valor
        require(bytes(valueFromMap).length != 0, "Endereco Inexistente");
        require(
            ENS[domain].addressByValue[valueFromMap] == msg.sender, // encontra o dono do valor e compara com quem pede
            "Voce nao e o dono do valor!"
        );
        return valueFromMap;
    }

    function getValue(
        string memory domain,
        string memory value
    ) public view returns (address) {
        // como não modifica é view
        requireExistentDomain(domain);
        address domainAddress = ENS[domain].addressByValue[value];
        require(
            domainAddress != address(0), // garante que não é o endereço 0 (inicializado)
            "Nao existia endereco associado ao valor no dominio"
        );
        return domainAddress;
    }

    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
