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
    mapping(string => Domain) ethereumNameSystem; // um domínio é uma struct identificada por uma url
    uint baseFee; // este é o custo de máximo: 1 caractere.

    // identificada pelo nome (que não é atributo aqui)
    struct Domain {
        bool initialized; // marca que o owner já inicializou
        mapping(string => address) addressByValue; // identifica quais endereços são identificáveis com values
        mapping(address => string) valuesByAddress; // identifica um value por address
    }

    constructor(uint fee) {
        owner = msg.sender;
        baseFee = fee; // por padrao vou colocar 100_000 GWEI
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "so o dono pode registrar");
        _;
    }

    modifier domainExists(string memory domain) {
        require(
            ethereumNameSystem[domain].initialized == true,
            "Dominio inexistente"
        );
        _;
    }

    function registerDomain(string memory domain) public onlyOwner {
        ethereumNameSystem[domain].initialized = true; // seta iniciado para garantir em setvalues
    }

    function isNotSetValueNorAddress(
        string memory domain,
        string memory value,
        address valueOwner
    ) private view returns (bool) {
        return
            ethereumNameSystem[domain].addressByValue[value] == address(0) &&
            keccak256(
                abi.encode(
                    ethereumNameSystem[domain].valuesByAddress[valueOwner]
                )
            ) ==
            keccak256(abi.encode(""));
    }

    function getWeiNeed(string memory name) private view returns (uint) {
        return uint(baseFee / bytes(name).length); // o custo cai com mais caracteres
    }

    function setValue(
        string memory domain,
        string memory value
    ) public payable domainExists(domain) {
        require(
            keccak256(abi.encode(value)) != keccak256(""),
            "Nao pode setar string vazia!"
        );
        require(
            isNotSetValueNorAddress(domain, value, msg.sender),
            "Ja existe uma relacao com o value"
        );
        require(
            getWeiNeed(value) <= msg.value,
            "Voce deve pagar de acordo com o inverso do tamanho do nome."
        );
        ethereumNameSystem[domain].addressByValue[value] = msg.sender;
        ethereumNameSystem[domain].valuesByAddress[msg.sender] = value;
    }

    function getValue(
        string memory domain,
        address domainOwner
    ) public view domainExists(domain) returns (string memory) {
        // como não modifica é view, gas 0
        string memory valueFromMap = ethereumNameSystem[domain].valuesByAddress[
            domainOwner
        ]; // encontra o valor
        require(bytes(valueFromMap).length != 0, "Endereco Inexistente");
        require(
            ethereumNameSystem[domain].addressByValue[valueFromMap] ==
                msg.sender, // encontra o dono do valor e compara com quem pede
            "Voce nao e o dono do valor!"
        );
        return valueFromMap;
    }

    function getValue(
        string memory domain,
        string memory value
    ) public view domainExists(domain) returns (address) {
        // como não modifica é view, gas 0
        address domainAddress = ethereumNameSystem[domain].addressByValue[
            value
        ];
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
